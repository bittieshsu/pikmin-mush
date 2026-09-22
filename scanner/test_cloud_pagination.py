import unittest
from unittest.mock import patch
from urllib.parse import urlsplit, parse_qs
import scanner


class CloudPaginationTests(unittest.TestCase):
    def test_complete_pages_keep_first_metadata_and_dedupe(self):
        calls = []

        def fetch(path):
            params = parse_qs(urlsplit(path).query)
            calls.append(params)
            second = "cursor" in params
            return {"count": None if second else 2, "status": {"running": True},
                    "mushrooms": [{"id": "second" if second else "first"}],
                    "pagination": {"has_more": not second, "next_cursor": None if second else "next"}}

        with patch.object(scanner, "cloud_request", fetch):
            result = scanner.cloud_mushrooms_all()
        self.assertEqual([row["id"] for row in result["mushrooms"]], ["first", "second"])
        self.assertEqual(result["count"], 2)
        self.assertEqual(calls[1]["include_meta"], ["0"])

    def test_bad_cursor_or_failed_page_is_not_partial_success(self):
        first = {"mushrooms": [{"id": "first"}], "pagination": {"has_more": True, "next_cursor": "loop"}}
        for responses in ([first, first], [first, RuntimeError("network")]):
            with patch.object(scanner, "cloud_request", side_effect=responses):
                with self.assertRaises(RuntimeError):
                    scanner.cloud_mushrooms_all()


if __name__ == "__main__":
    unittest.main()
