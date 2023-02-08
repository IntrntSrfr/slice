import {Crop} from "react-image-crop";

type Profile = {
    id: string
    name: string
    active: boolean
    crop: Partial<Omit<Crop>>
}
  