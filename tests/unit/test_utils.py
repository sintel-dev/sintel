#!/usr/bin/env python
# -*- coding: utf-8 -*-


from sintel import utils


def test__read_config():
    path_to_config_file = 'config.yml'
    config = utils.read_config(path_to_config_file)

    assert isinstance(config, dict)
    assert config['ENV'] == 'production'
