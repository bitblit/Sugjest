export type DoneFn = (reason?: string | Error) => void;
export type TestName = string;
export type TestFn = (done?: DoneFn) => Promise<void | undefined | unknown> | void | undefined;
export type BlockFn = () => void;
export type BlockName = string;

export interface SugjestOptions {
  namespace: string;
  enabledTags?: string[];
  reqParams?: string[];
}


export interface SugjestDescribe {
  (blockName: BlockName, blockFn: BlockFn): void;
}

export interface SugjestIt {
  (testName: TestName, fn: TestFn, timeout?: number): void;
}
