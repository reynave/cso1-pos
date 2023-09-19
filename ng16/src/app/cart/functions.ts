// export const func = [
//     { id: 1, value: () => { console.log("aaa"); } },
//     { id: 2, value: () => { console.log("bbb"); } },
//     { id: 3, value: () => { console.log("ccc"); } }, 
//   ];

export interface MyFunction {
    id: number;
    value: () => void;
    label: string;
}