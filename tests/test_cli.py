"""
Basic tests for the CLI functionality.
"""

import pytest
from click.testing import CliRunner
from sbp_generator.cli import cli


def test_cli_help():
    """Test that CLI shows help."""
    runner = CliRunner()
    result = runner.invoke(cli, ['--help'])
    assert result.exit_code == 0
    assert 'SBP Folder Generator CLI' in result.output


def test_cli_version():
    """Test that CLI shows version."""
    runner = CliRunner()
    result = runner.invoke(cli, ['--version'])
    assert result.exit_code == 0
    assert '0.1.0' in result.output


def test_config_command():
    """Test config command."""
    runner = CliRunner()
    result = runner.invoke(cli, ['config'])
    assert result.exit_code == 0


def test_clients_list():
    """Test clients list command."""
    runner = CliRunner()
    result = runner.invoke(cli, ['clients', 'list'])
    assert result.exit_code == 0 