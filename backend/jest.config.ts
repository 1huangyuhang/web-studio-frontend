import type { Config } from 'jest';

const config: Config = {
  // 设置测试环境
  testEnvironment: 'node',
  // 使用ts-jest处理TypeScript文件
  preset: 'ts-jest',
  // 设置测试文件的匹配模式
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  // 模块名称映射，匹配tsconfig中的paths配置
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 忽略node_modules目录
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  // 收集覆盖率信息
  collectCoverage: true,
  // 覆盖率报告的目录
  coverageDirectory: 'coverage',
  // 覆盖率报告的格式
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  // 覆盖率收集的文件
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/app.ts'],
  // 强制测试失败后退出
  forceExit: true,
  // 显示测试执行时间
  verbose: true,
};

export default config;
