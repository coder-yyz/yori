/**
 * src/models/index.ts
 * 统一导出所有 Model，以及 transform-model 的环境 API
 */
export * from './blog.model';
export * from './photo.model';
export * from './user.model';

// 导出环境控制 API，方便在 main.tsx 初始化
export { setEnv, enableMock, disableMock, isMockEnabled } from 'transform-model';
export type { TransformEnv } from 'transform-model';
