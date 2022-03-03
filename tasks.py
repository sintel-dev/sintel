import os
import re
import shutil
import stat

from invoke import task


@task
def restapi(c):
    c.run('python -m pytest -n 4 ./tests/restapi')

@task
def unit(c):
    c.run('python -m pytest ./tests/unit --cov=sintel')

@task
def install_minimum(c):
    with open('setup.py', 'r') as setup_py:
        lines = setup_py.read().splitlines()

    versions = []
    started = False
    for line in lines:
        if started:
            if line == ']':
                started = False
                continue
            line = line.strip()
            if (len(line) > 0) and (line[0] == '#'):
                continue
            line = re.sub(r',?<=?[\d.]*,?', '', line)
            line = re.sub(r'>=?', '==', line)
            line = re.sub(r"""['",]""", '', line)
            versions.append(line)

        elif line.startswith('install_requires = ['):
            started = True

    c.run(f'python -m pip install {" ".join(versions)}')


@task
def minimum(c):
    install_minimum(c)
    c.run('python -m pip check')
    unit(c)
    restapi(c)


@task
def lint(c):
    c.run('flake8 sintel tests --ignore W503')
    c.run('isort -c --recursive sintel tests')
    # c.run('pydocstyle sintel')


def remove_readonly(func, path, _):
    "Clear the readonly bit and reattempt the removal"
    os.chmod(path, stat.S_IWRITE)
    func(path)


@task
def rmdir(c, path):
    try:
        shutil.rmtree(path, onerror=remove_readonly)
    except PermissionError:
        pass
