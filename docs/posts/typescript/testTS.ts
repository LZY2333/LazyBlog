// 下划线转驼峰
type CamelCase<Str extends string> =
    Str extends `${infer Left}_${infer Right}${infer Rest}`
        ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
        : Str

// 如果想对整个数组调用CamelCase，需要递归
type CamelCaseArr<Arr extends unknown[]> = Arr extends [
    infer Item,
    ...infer RestArr
]
    ? [CamelCase<Item & string>, ...CamelCaseArr<RestArr>]
    : []

// 如果想对联合类型调用CamelCase，不需要递归
type CamelCaseUnion<Item extends string> = CamelCase<Item>

// "aAA" | "bBB"
type test = CamelCaseUnion<'a_a_a' | 'b_b_b'>

type ConcatStr<
    T extends string,
    U extends string
> = `${T}-${U}`

// "A-a" | "A-b" | "B-a" | "B-b"
type A = ConcatStr<'A' | 'B', 'a' | 'b'>

// { a: true, b: true }
type DistributeKey = {
    [K in 'a' | 'b']: true
}
type DistributeValue = {
    k: 'a' | 'b'
}

type GetOptional<Obj extends Record<string, any>> = {
    [Key in keyof Obj as {} extends Pick<Obj, Key>
        ? Key
        : never]: Obj[Key]
}
// { b?: number | undefined; }
type testGetOptional = GetOptional<{ a: 1; b?: number }>

type isRequired<
    Key extends keyof Obj,
    Obj
> = {} extends Pick<Obj, Key> ? never : Key

type GetRequired<Obj extends Record<string, any>> = {
    [Key in keyof Obj as isRequired<Key, Obj>]: Obj[Key]
}
// { a: 1 }
type testGetRequired = GetRequired<{ a: 1; b?: number }>

type RemoveIndexSignature<Obj extends Record<string, any>> =
    {
        [Key in keyof Obj as Key extends `${infer Str}`
            ? Str
            : never]: Obj[Key]
    }
// { a: 1 }
type testGetRemoveIndexSignature = RemoveIndexSignature<{
    [key: string]: any
    a: 1
}>

type ClassPublicProps<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Obj[Key]
}

// 这里!只为了过TS检查
class testClass {
    public a!: boolean
    protected b!: number
    private c!: string
}
// { a: boolean }
type testGetClassPublicProps = ClassPublicProps<testClass>

const obj = { a: 1, b: 2 }

// { a: number; b: number; }
type TypeObj = typeof obj

const arrConst = [1, 2] as const
type arrConstType = typeof arrConst

type IsConstOnly<Arr> =
    // 这里必须加only
    Arr extends readonly [infer A, infer B] ? true : false
// true
type testGetConstOnly = IsConstOnly<arrConstType>

type BadIsNever<T> = T extends never ? true : false
// never
type testBadIsNever = BadIsNever<never>

// 写一个TS,展开元组类型的所有属性,

type DeepReadonly<Obj extends Record<string, any>> = {
    readonly [Key in keyof Obj]: Obj[Key] extends object
        ? Obj[Key] extends Function
            ? Obj[Key]
            : DeepReadonly<Obj[Key]>
        : Obj[Key]
}

type DeepReadonly2<Obj extends Record<string, any>> =
    Obj extends any
        ? {
              readonly [Key in keyof Obj]: Obj[Key] extends object
                  ? Obj[Key] extends Function
                      ? Obj[Key]
                      : DeepReadonly2<Obj[Key]>
                  : Obj[Key]
          }
        : never
type obj = { a: { b: { c: string } } }

// {readonly a: DeepReadonly<{b:{c: string}}>}
type obj1 = DeepReadonly<obj>
// {readonly a: {readonly b: {readonly c: string}}}
type obj2 = DeepReadonly2<obj>

// DeepReadonly3 内部调用了 extends结构的 DeepReadonly
type DeepReadonly3<Obj extends Record<string, any>> =
    Obj extends any
        ? {
              readonly [Key in keyof Obj]: Obj[Key] extends object
                  ? Obj[Key] extends Function
                      ? Obj[Key]
                      : DeepReadonly<Obj[Key]>
                  : Obj[Key]
          }
        : never
// DeepReadonly 内部无 extends结构, 所以obj3没有展开b
// {readonly a: DeepReadonly<{b:{c: string}}>}
type obj3 = DeepReadonly3<obj>

// ------------------------------------------------------------------------
// 工具，解析形如 key=value 的字符串为对象类型
type ParseParam<Param extends string> =
    Param extends `${infer Key}=${infer Value}`
        ? { [K in Key]: Value }
        : {}

// 工具: Key相同的两个value合并为数组
// 注意: value本身可能已经是数组，由于是从后往前，所以只有Other可能是数组
type MergeValues<One, Other> = One extends Other
    ? // 俩value相等, 随便返回谁
      One
    : // 俩value不相等, 开始合并
    Other extends unknown[]
    ? // Other是数组, 解构other合并
      [One, ...Other]
    : // Other不是数组, 直接合并
      [One, Other]

// 第二层，这里都是ParseParam过的数据，从<{b:3}, {c:4}>开始
type MergeParams<
    OneParam extends Record<string, any>,
    OtherParam extends Record<string, any>
> = {
    // 遍历两个对象的key
    [Key in
        | keyof OneParam
        | keyof OtherParam]: Key extends keyof OneParam
        ? Key extends keyof OtherParam
            ? // Key在1中,又在2中,value就要合并为数组
              MergeValues<OneParam[Key], OtherParam[Key]>
            : // Key在1中,不在2中,返回1的value
              OneParam[Key]
        : Key extends keyof OtherParam
        ? // Key不在1中,在2中,返回2的value
          OtherParam[Key]
        : // Key不在1中,不在2中,返回never
          never
}

// 第一层
type ParseQueryString<Str extends string> =
    Str extends `${infer Param}&${infer Rest}`
        ? // MergeParams 会在回溯阶段从后往前执行,也就是说最后两个参数会先合并,然后往前推
          MergeParams<
              ParseParam<Param>,
              ParseQueryString<Rest>
          >
        : // 到这里其实是，最后一个参数，直接parse并返回上一层,然后开始 MergeParams
          ParseParam<Str>

// { a: ["1", "2"]; b: "2"; c: "3"; }
type ParseQueryStringResult =
    ParseQueryString<'a=1&a=2&b=2&c=3'>
// ------------------------------------------------------------------------

type x = { a: 1 } | { a: 2 } | { b: 3 } | { c: 4 }

type k = keyof x

type xx = { a: [1, 2]; b: 3; c: 4 }

// 提取函数 参数类型
type Parameters0<T extends (...args: any) => any> =
    T extends (...args: infer P) => any ? P : never

// 提取函数 返回类型
type ReturnType0<T extends (...args: any) => any> =
    T extends (...args: any) => infer R ? R : never

// 提取函数this类型
type ThisParameterType0<T> = T extends (
    this: infer U,
    ...args: any[]
) => any
    ? U
    : unknown

// 移除函数this类型
type OmitThisParameter0<T> =
    unknown extends ThisParameterType<T>
        ? T
        : T extends (...args: infer A) => infer R
        ? (...args: A) => R
        : T

// 提取构造器 参数类型
type ConstructorParameters0<
    T extends abstract new (...args: any) => any
> = T extends abstract new (...args: infer P) => any
    ? P
    : never

// 提取构造器 返回类型(实例)
type InstanceType0<
    T extends abstract new (...args: any) => any
> = T extends abstract new (...args: any) => infer R
    ? R
    : never

type KebaCaseToCamelCase<T extends string> =
    T extends `${infer First}-${infer Rest}`
        ? `${First}${KebaCaseToCamelCase<Capitalize<Rest>>}`
        : T
// "aaaBbbCcc"
type testKebaCaseToCamelCase =
    KebaCaseToCamelCase<'aaa-bbb-ccc'>

type CamelCaseToKebaCase<T extends string> =
    T extends `${infer First}${infer Rest}`
        ? First extends Lowercase<First>
            ? `${First}${CamelCaseToKebaCase<Rest>}`
            : Debug<`-${Lowercase<First>}${CamelCaseToKebaCase<Rest>}`>
        : T
// "aaa-bbb-ccc"
type testCamelCaseToKebaCase =
    CamelCaseToKebaCase<'aaaBbbCcc'>
console.log('开始')
const testCamelCaseToKebaCaseVariable: testCamelCaseToKebaCase =
    'aaa-bbb-ccc'
type Debug<T> = T

type Chunk<
    T extends unknown[],
    ItemLen extends number,
    CurItem extends unknown[] = [],
    R extends unknown[] = []
> = T extends [infer First, ...infer Rest]
    ? CurItem['length'] extends ItemLen
        ? Chunk<Rest, ItemLen, [First], [...R, CurItem]>
        : Chunk<Rest, ItemLen, [...CurItem, First], R>
    : [...R, CurItem]

//  [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
type testChunk = Chunk<[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3>

// { a: { b: { c: 'xxx' } } }
type testTupleToNestedObject = TupleToNestedObject<
    ['a', 'b', 'c'],
    'xxx'
>

type TupleToNestedObject<
    Tuple extends unknown[],
    Value
> = Tuple extends [infer First, ...infer Rest]
    ? {
          [Key in First as Key extends keyof any
              ? Key
              : never]: Rest extends unknown[]
              ? TupleToNestedObject<Rest, Value>
              : Value
      }
    : Value

interface Dong {
    name: string
    age: number
    address: string
}

type Copy<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Obj[Key]
}

type PartialObjectPropByKeys<
    T extends Record<string, any>,
    Key extends keyof any
> = Copy<
    Partial<Pick<T, Extract<keyof T, Key>>> & Omit<T, Key>
>

// { name?: string | undefined; age: number; address: string; }
type testPartialObjectPropByKeys = PartialObjectPropByKeys<
    Dong,
    'name'
>

// 1. 交叉类型实现重载效果
type Overloaded = ((x: number) => string) &
    ((x: string) => number)

// 2. interface 中定义多个函数签名
interface OverloadedFn {
    (x: number): string
    (x: string): number
}

// 3. 函数实现时重载语法（签名 + 实现）
function fn(x: number): string
function fn(x: string): number
function fn(x: any): any {
    return typeof x === 'number' ? x.toString() : x.length
}

type UnionToIntersection<U> = (
    U extends U ? (x: U) => unknown : never
) extends (x: infer R) => unknown
    ? R
    : never

// { a: string; } & { b: number; }
type testUnionToIntersection = UnionToIntersection<
    { a: string } | { b: number }
>

// 联合类型转元组类型
type UnionToTuple<T> = UnionToIntersection<
    T extends any ? () => T : never
> extends () => infer ReturnType
    ? [...UnionToTuple<Exclude<T, ReturnType>>, ReturnType]
    : []

// [1, 2, 3]
type testUnionToTuple = UnionToTuple<1 | 2 | 3>

type CurriedFunc<Params, Return> = Params extends [
    infer Arg,
    ...infer Rest
]
    ? (arg: Arg) => CurriedFunc<Rest, Return>
    : never

declare function currying<Func>(
    fn: Func
): Func extends (...args: infer Params) => infer Result
    ? CurriedFunc<Params, Result>
    : never

// 使用 interface 表达 currying 函数的类型签名
interface Currying {
    <Func>(fn: Func): Func extends (
        ...args: infer Params
    ) => infer Result
        ? CurriedFunc<Params, Result>
        : never
}

const func = (a: boolean, b: number, c: string) => {}
// (arg: boolean) => (arg: number) => (arg: string) => never
const curriedFunc = currying(func)
// (arg: boolean) => (arg: number) => (arg: string) => never
declare const currying2: Currying
const curriedFunc2 = currying2(func)

interface Join {
    <Delimiter extends string>(delimiter: Delimiter): <
        Items extends string[]
    >(
        ...items: Items
    ) => JoinType<Items, Delimiter>
}

type RemoveFirstDelimiter<Str extends string> =
    Str extends `${infer _}${infer Rest}` ? Rest : Str

type JoinType<
    Items extends any[],
    Delimiter extends string,
    Result extends string = ''
> = Items extends [infer Cur, ...infer Rest]
    ? JoinType<
          Rest,
          Delimiter,
          `${Result}${Delimiter}${Cur & string}`
      >
    : RemoveFirstDelimiter<Result>

// "l-z-y"
declare const join: Join
let res = join('-')('l', 'z', 'y')

interface Add1 {
    (a: number): (b: number) => number
}
// 使用type就可以改写成都为 => 的写法
type Add2 = (a: number) => (b: number) => number

declare const add1: Add1
declare const add2: Add2
add1(1)(2)
add1(1)(2)

type Obj = {
    a: {
        b: {
            b1: string
            b2: string
        }
        c: {
            c1: string
            c2: string
        }
    }
}

type AllKeyPath<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Key extends string
        ? Obj[Key] extends Record<string, any>
            ? Key | `${Key}.${AllKeyPath<Obj[Key]>}`
            : Key
        : never
}[keyof Obj]

// "a" | "a.b" | "a.c" | "a.b.b1" | "a.b.b2" | "a.c.c1" | "a.c.c2"
type AllKeyPathRes = AllKeyPath<Obj>

type Defaultize<A, B> = Pick<A, Exclude<keyof A, keyof B>> &
    Partial<Pick<A, Extract<keyof A, keyof B>>> &
    Partial<Pick<B, Exclude<keyof B, keyof A>>>

// type Copy<Obj extends Record<string, any>> = {
//     [Key in keyof Obj]: Obj[Key]
// }

type AA = { aaa: 111; bbb: 222 }
type BB = { bbb: 222; ccc: 333 }

// { aaa: 111; bbb?: 222 | undefined; ccc?: 333 | undefined; }
type DefaultizeRes = Copy<Defaultize<AA, BB>>

type TestInferLast<T extends string[]> = T extends [
    ...infer _Rest,
    infer Last
]
    ? `last${Last & string}`
    : never

type TestInferLast1<T extends string[]> = T extends [
    ...infer _Rest,
    infer Last extends string
]
    ? // 报错，不能将类型"Last"分配给类型"string | xxx"
      // 因为，infer推导的元素默认为unknown类型
      `last${Last}`
    : never

type StrToNum<Str> =
    Str extends `${infer Num extends number}` ? Num : Str

// 123
type testSingleStrToNum = StrToNum<'123'>

enum Code {
    a = 111,
    b = 222,
    c = 'abc',
}

// "111" | "222" | "abc"
type testCode = `${Code}`
// 获取enum 的value类型
// 111 | 222 | "abc"
type testStrToNum = StrToNum<`${Code}`>

type Test1 = never extends string ? true : false // true ✅
type Test2 = undefined extends void ? true : false // true ✅
type Test3 = any extends unknown ? true : false // true ✅
type Test4 = unknown extends any ? true : false // true ✅（双向兼容）
type Test5 = void extends undefined ? true : false // true ✅
type Test6 = null extends void ? true : false // true ✅（但依赖 tsconfig）

// 可赋值关系演示
// let a: void
// let b: undefined = undefined
// let c: null = null
// let d: never = undefined as never

// a = c // ✅ void 可以接收 null（strictNullChecks: false）
// a = b // ✅ void 可以接收 undefined(特殊)
// a = c // ✅ void 可接收 null（strictNullChecks: false）

// b = a // ❌ undefined 不能接收 void
// b = c // ✅ undefined 可以接收 null（strictNullChecks: false）
// b = d // ✅ undefined 可以接收 never

// c = a // ❌ null 不能接收 void
// c = b // ✅ null 可以接收 undefined（strictNullChecks: false）
// c = d // ✅ null 可以接收 never

// d = a // ❌ never 不能接收 void
// d = b // ❌ never 不能接收 undefined
// d = c // ❌ never 不能接收 null

type F1 = <T>() => T extends any ? 1 : 2 // always 1
type F2 = <T>() => T extends string ? 1 : 2

type Test = F1 extends F2 ? true : false // false ✅

// 之前写过Zip类型
// [[1, 4], [2, 5], [3, 6]]
type testZipType = Zip<[1, 2, 3], [4, 5, 6]>

const sym1 = Symbol('key');
const sym2 = Symbol('key');

type Zip<
    T extends unknown[],
    U extends unknown[]
> = T extends [infer FT, ...infer RT]
    ? U extends [infer FU, ...infer RU]
        ? [[FT, FU], ...Zip<RT, RU>]
        : []
    : []


    
// 针对符合 Zip结构 的重载，返回类型为 Zip<T, U>
function zipFunc<T extends unknown[], U extends unknown[]>(a1: T, a2: U): Zip<T, U>
function zipFunc<T, U>(a1: T[], a2: U[]): [T, U][]
function zipFunc(a1: any[], a2: any[]) {
    return a1.map((item, index) => [item, a2[index]])
}

// [[1, 4], [2, 5], [3, 6]]
const testZip = zipFunc([1, 2, 3] as const, [4, 5, 6] as const)
// []
const testZip2 = zipFunc([1, 2, 3], [4, 5, 6])



// 通过函数重载，针对常量元组参数，TS 能推断出精确的 Zip<T, U> 类型，
// 这样 testZip 的类型就能得到 [[1, 4], [2, 5], [3, 6]]。
// 对于普通数组参数，返回类型为 [T, U][]，类型宽泛，避免类型不匹配报错。

