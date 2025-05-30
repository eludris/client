import { SphereChannel } from "./channel";

export interface Category {
    id: number;
    name: string;
    channels: SphereChannel[];
    position: number;
}