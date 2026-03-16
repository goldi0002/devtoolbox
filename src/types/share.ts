export type ToolInfoShare = {
    name: string
    description: string
    category: string
    slug: string
    url: string
}

export type ToolDataShare<T = unknown> = {
    input: T
    output?: T
    tool: ToolInfoShare
    meta?: {
        mode?: string
        language?: string
        createdAt?: number
    }
}


export type JsonDataShare = ToolDataShare<string>