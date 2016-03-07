#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Install icestorm toolchain in Icestudio path using apio
# March 2016
# GPLv2

import sys
import subprocess

from platform import system
from datetime import datetime
from os.path import join, expanduser, normpath

__author__ = 'Jesús Arroyo Torrens <jesus.arroyo@bq.com>'
__license__ = 'GNU General Public License v2 http://www.gnu.org/licenses/gpl2.html'


VIRTUALENV = 'virtualenv-14.0.1'
ICESTUDIO_PATH = join(expanduser('~'), '.icestudio')
ICESTUDIO_BIN = join(ICESTUDIO_PATH, 'bin')
ICESTUDIO_PIP = join(ICESTUDIO_BIN, 'pip')
ICESTUDIO_APIO = join(ICESTUDIO_BIN, 'apio')
PYTHON_EXE = normpath(sys.executable)


def run(commands):
    result = {
        "out": None,
        "err": None,
        "returncode": None}

    p = subprocess.Popen(
        commands,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=system() == "Windows")

    try:
        result['out'], result['err'] = p.communicate()
        result['returncode'] = p.returncode
    except KeyboardInterrupt:
        print("Aborted by user")
        exit(1)

    return result

begin = datetime.now()

print(run([PYTHON_EXE, '--version'])['err'])

# $ curl -O https://pypi.python.org/packages/source/v/virtualenv/virtualenv-X.X.tar.gz
# $ tar xvfz virtualenv-X.X.tar.gz

print(run([PYTHON_EXE, join(VIRTUALENV, 'virtualenv.py'), ICESTUDIO_PATH])['out'])

print(run([ICESTUDIO_PIP, 'install', '-U', 'apio'])['out'])

print(run([ICESTUDIO_APIO, '--version'])['out'])

print(run([ICESTUDIO_APIO, 'install'])['out'])

print(datetime.now() - begin)
