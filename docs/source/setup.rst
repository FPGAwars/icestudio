.. _setup:

Setup
=====

This is a quick start guide to setup the development environment for Icestudio.

Install `Python 2.7 <https://www.python.org/downloads/>`_ and `Node.js <https://nodejs.org/>`_.

`Atom <https://atom.io/>`_ editor with `linter-jshint <https://atom.io/packages/linter-jshint>`_ is recommended.

Download
--------

.. code::

  git clone https://github.com/FPGAwars/icestudio.git
  cd icestudio


Install
-------

.. code::

  npm install


Execute
-------

.. code::

  npm start


Languages
---------

Add or update the `app translations <https://github.com/FPGAwars/icestudio/tree/develop/app/resources/locale>`_ using `Poedit <https://poedit.net/>`_.

Developer note: use ``npm run gettext`` to extract the labels from the code.

Package
-------

.. code::

  npm run dist

===========  ===============  =============
 Target OS    Development OS   Output files
===========  ===============  =============
 GNU/Linux      GNU/Linux      (linux32,linux64).zip, (linux32,linux64).AppImage
 Windows        GNU/Linux      (win32,win64).zip, (win32,win64).exe
 Mac OS         Mac OS         (osx32,osx64).zip, osx64.dmg
===========  ===============  =============

Apio configuration
------------------

Apio backend is configured in the ``app/package.json`` file:

- ``apio.min``: minimum version (>=)
- ``apio.max``: maximum version (<)
- ``apio.extras``: list of external Python programmers (*blackiceprog*, *tinyfpgab*)
- ``apio.external``: load an external Apio package instead of the default one (e.g. */path/to/my/apio*)
- ``apio.branch``: install Apio from the repository branch instead of PyPI.

An external Apio package can be also set on runtime using the ``ICESTUDIO_APIO`` environment variable.
