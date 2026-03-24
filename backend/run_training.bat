@echo off
set PYTHONPATH=D:\Projects\DevHub\vitalsense\backend
cd /d D:\Projects\DevHub\vitalsense\backend
C:\Users\derri\miniconda3\envs\ai_env\python.exe models\train_ensemble.py > train_log.txt 2>&1
echo Exit code: %ERRORLEVEL% >> train_log.txt
