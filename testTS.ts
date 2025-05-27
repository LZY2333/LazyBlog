type Includes<
    Arr extends unknown[],
    FindItem
> = Arr extends [infer First, ...infer Rest]
    ? IsEqual<First, FindItem> extends true
        ? true
        : Includes<Rest, FindItem>
    : false

type IsEqual<A, B> = (A extends B ? true : false) &
    (B extends A ? true : false)

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

type BuildArray<
    Length extends number,
    Ele = unknown,
    Arr extends unknown[] = []
> = Arr['length'] extends Length
    ? Arr
    : BuildArray<Length, Ele, [...Arr, Ele]>

type Add<Num1 extends number, Num2 extends number> = [
    ...BuildArray<Num1>,
    ...BuildArray<Num2>
]['length']

type Subtract<
    Num1 extends number,
    Num2 extends number
> = BuildArray<Num1> extends [
    ...arr1: BuildArray<Num2>,
    ...arr2: infer Rest
]
    ? Rest['length']
    : never

type a = Subtract<54, 80>

type Multiply<
    N1 extends number,
    N2 extends number,
    R extends unknown[] = []
> = N2 extends 0
    ? R['length']
    : Multiply<
          N1,
          Subtract<N2, 1>,
          [...BuildArray<N1>, ...R]
      >

type Divide<
    N1 extends number,
    N2 extends number,
    R extends unknown[] = []
> = N1 extends 0
    ? R['length']
    : Divide<Subtract<N1, N2>, N2, [unknown, ...R]>

type StrLen<
    Str extends string,
    R extends unknown[] = []
> = Str extends `${string}${infer Rest}`
    ? StrLen<Rest, [...R, unknown]>
    : R['length']

type UppercaseA<Item extends string> = Item extends 'a'
    ? Uppercase<Item>
    : Item

type Result = UppercaseA<'a' | 'b' | 'c'>

// 下划线转驼峰
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
        : Str

// 数组转驼峰
type CamelCaseArr<Arr extends unknown[]> = Arr extends [
    infer Item,
    ...infer RestArr
]
    ? [CamelCase<Item & string>, ...CamelCaseArr<RestArr>]
    : []

// 联合类型转驼峰
type CamelCaseUnion<Item extends string> =
    Item extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCaseUnion<Rest>}`
        : Item

type test4<T extends string[]> = `__${T[number]}`

// "__aaa" | "__bbb"
type test5 = test4<['aaa', 'bbb']>

type Combination<A extends string, B extends string> =
    | A
    | B
    | `${A}${B}`
    | `${B}${A}`

type AllCombinations<
    A extends string,
    B extends string = A
> = A extends A
    ? Combination<A, AllCombinations<Exclude<B, A>>>
    : never

// "A" | "B" | "C" | "BC" | "CB" | "AB" | "AC" | "ABC" | "ACB" | "BA" | "CA" | "BCA" | "CBA" | "BAC" | "CAB"
type test6 = AllCombinations<'A' | 'B' | 'C'>

// 之前的简易实现
type IsEqual0<A, B> = (A extends B ? true : false) &
    (B extends A ? true : false)
// true, 无法判别any
type isEqualRes0 = IsEqual0<'a', any>

// 最终实现
type IsEqual1<A, B> = (<T>() => T extends A
    ? 1
    : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
// false
type isEqualRes = IsEqual1<'a', any>

type IsUnion<A, B = A> = A extends A
    ? [B] extends [A]
        ? false
        : true
    : never

type test7 = IsUnion<1>

type TestAny<T> = T extends number ? 1 : 2
// 1 | 2
type test8 = TestAny<any>

type IsTuple<T> = T extends [...params: infer args]
    ? NotEqual<args['length'], number>
    : false

type NotEqual<A, B> = (<T>() => T extends A
    ? 1
    : 2) extends <T>() => T extends B ? 1 : 2
    ? false
    : true
// true
type test9 = IsTuple<[1, 2, 3]>

type UnionToIntersection<U> =
    (U extends U ? (x: U) => unknown : never) extends
    (x: infer R) => unknown
    ? R
    : never
