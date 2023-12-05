import { Dispatch, SetStateAction, useState } from "react"

export enum LoadingState {
    None,

    Loading,
    Success,
    Failure,

    Error
}

export type State<T> = [T, Dispatch<SetStateAction<T>>]

export abstract class BackendData<T, LoadParams> {
    data: T | undefined
    state: State<T>

    loadingState:LoadingState = LoadingState.None

    constructor(params:{state: State<T>}) {
        this.state = params.state
    }

    abstract _load(params?:LoadParams): void;
    abstract _load(params?:LoadParams): void;

    load(params?:LoadParams & {force_update:boolean}) {
        if (this.loadingState === LoadingState.Success) {
            if (!params?.force_update)
                return
        }
        this._load(params)
    }
}

export function useBackendState() {
    
}

