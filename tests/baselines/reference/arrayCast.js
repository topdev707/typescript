[{ foo: "s" }]; //Error { foo:string }[] is not assignable to by {id: number;}[]
[{ foo: "s" }, {}]; // Should succeed without contextual typing, as the {} element causes the type of the array to be {}[]
