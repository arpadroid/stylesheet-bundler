export type BundlerCommandArgsType = Record<string, any> & {
    watch?: boolean;
    mode?: 'development' | 'production';
    verbose?: boolean;
};
