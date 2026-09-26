"""
SQLite persistence service for PQC Migration Scanner.
Stores scan history, findings, migration checklist updates, and baselines.
"""

import sqlite3
import json
import os
from typing import Optional, List, Dict, Any
from app.schemas.scan import ScanResult, ScanSummary


class StorageService:
    def __init__(self, db_path: str = "scanner.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scans (
                    scan_id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    target_path TEXT,
                    status TEXT,
                    summary_json TEXT,
                    result_json TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS migration_updates (
                    scan_id TEXT,
                    item_id TEXT,
                    status TEXT,
                    owner TEXT,
                    notes TEXT,
                    gates_json TEXT,
                    PRIMARY KEY (scan_id, item_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS baselines (
                    id TEXT PRIMARY KEY,
                    scan_id TEXT,
                    created_at TEXT,
                    baseline_json TEXT
                )
            """)
            conn.commit()

    def save_scan(self, result: ScanResult):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO scans (scan_id, timestamp, target_path, status, summary_json, result_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    result.summary.scan_id,
                    result.summary.timestamp,
                    result.summary.target_path,
                    result.summary.status,
                    result.summary.model_dump_json(),
                    result.model_dump_json()
                )
            )
            conn.commit()

    def get_scan(self, scan_id: str) -> Optional[ScanResult]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT result_json FROM scans WHERE scan_id = ?", (scan_id,))
            row = cursor.fetchone()
            if row:
                data = json.loads(row[0])
                res = ScanResult(**data)

                # Merge any migration status overrides
                cursor.execute("SELECT item_id, status, owner, notes, gates_json FROM migration_updates WHERE scan_id = ?", (scan_id,))
                updates = cursor.fetchall()
                update_map = {u[0]: u for u in updates}
                for item in res.migration_plan:
                    if item.id in update_map:
                        _, status, owner, notes, gates_json = update_map[item.id]
                        item.status = status
                        item.owner = owner
                        item.notes = notes
                        if gates_json:
                            item.validation_gates = json.loads(gates_json)
                return res
        return None

    def list_scans(self) -> List[ScanSummary]:
        summaries: List[ScanSummary] = []
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT summary_json FROM scans ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            for r in rows:
                try:
                    summaries.append(ScanSummary(**json.loads(r[0])))
                except Exception:
                    pass
        return summaries

    def update_migration_item(self, scan_id: str, item_id: str, status: str, owner: str, notes: str, gates: list):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO migration_updates (scan_id, item_id, status, owner, notes, gates_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (scan_id, item_id, status, owner, notes, json.dumps(gates))
            )
            conn.commit()

    def set_baseline(self, scan_id: str, result_json: str):
        import datetime
        with self._get_connection() as conn:
            cursor = conn.cursor()
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            cursor.execute(
                "INSERT OR REPLACE INTO baselines (id, scan_id, created_at, baseline_json) VALUES ('default', ?, ?, ?)",
                (scan_id, now, result_json)
            )
            conn.commit()

    def get_baseline(self) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT baseline_json FROM baselines WHERE id = 'default'")
            row = cursor.fetchone()
            if row:
                return json.loads(row[0])
        return None

    def clear_all(self):
        """Purge all stored scans, migration overrides, and baselines."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM scans")
            cursor.execute("DELETE FROM migration_updates")
            cursor.execute("DELETE FROM baselines")
            conn.commit()
