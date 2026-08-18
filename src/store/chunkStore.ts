import { create } from "zustand";
import { ChunkInterface } from "@/interfaces/ChunkInterface";
import { PaginationInterface } from "@/interfaces/CommonInterface";
import { axiosClient } from "@/utils/axiosClient";

interface ChunkStore {}

export const useChunkStore = create<ChunkStore>((set, get) => ({}));
