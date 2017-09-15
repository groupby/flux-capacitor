export const isString = (name: string) => ({
    func: (value: any) => typeof value === 'string' && value.trim().length !== 0,
    msg: `"${name}" must be a non-empty string`
});