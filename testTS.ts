type Includes<Arr extends unknown[], FindItem> = Arr extends [
    infer First,
    ...infer Rest
]
    ? IsEqual<First, FindItem> extends true
        ? true
        : Includes<Rest, FindItem>
    : false

type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false)

type arr3 = [1, 2, 3, 4, 5]
type res = Includes<arr3, 3> // true
type res2 = Includes<arr3, 6> // false

type Flatten<
    Arr extends unknown[],
    Result extends unknown[] = []
> = Arr extends [infer First, ...infer Rest]
    ? First extends unknown[]
        ? Flatten<Rest, [...Result, ...First]>
        : Flatten<Rest, [...Result, First]>
    : Result

type DeepFlatten<
    Arr extends unknown[],
    Result extends unknown[] = []
> = Arr extends [infer First, ...infer Rest]
    ? First extends unknown[]
        ? Flatten<[...First, ...Rest], Result>
        : Flatten<Rest, [...Result, First]>
    : Result
