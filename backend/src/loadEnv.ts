/** 侧载 Request 类型合并；须 import 可解析的 .ts，不能 import 仅存在的 .d.ts（运行时会报 Cannot find module） */
import './types/expressAugment';

import path from 'path';
import dotenv from 'dotenv';

/** 始终从 backend 目录读取 .env，避免从仓库根目录启动时 cwd 不对导致 JWT_SECRET 未加载 */
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });
