#!/bin/bash

# 等待服务启动
sleep 3

# 在Trae浏览器中打开指定页面
trae http://localhost:5175/ http://localhost:5174/ http://localhost:3001/api-docs http://localhost:5555/