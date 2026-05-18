#!/bin/bash
cd /home/runner/workspace/backend/tradex
exec /home/runner/workspace/.pythonlibs/bin/python manage.py runserver 0.0.0.0:$PORT
