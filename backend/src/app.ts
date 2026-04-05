import './loadEnv';
import { createApp } from './createApp';

const { app, httpServer, io } = createApp();

/** 不导出 httpServer：开启 declaration 时 Node/http 与 events 的类型在再导出上会触发 TS4023 */
export { app, io };
export default app;

if (process.env['NODE_ENV'] !== 'test') {
  const PORT = Number(process.env['PORT']) || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
