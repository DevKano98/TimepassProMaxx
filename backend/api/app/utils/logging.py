"""
Structured logging setup. Every router/service should do:

    from app.utils.logging import get_logger
    logger = get_logger(__name__)

instead of using print().
"""
import logging
import sys


_CONFIGURED = False


def _configure_root_logger() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)
    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    _configure_root_logger()
    return logging.getLogger(name)
