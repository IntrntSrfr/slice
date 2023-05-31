import { type Crop } from 'react-image-crop';

interface Profile {
  id: string
  name: string
  active: boolean
  crop: Partial<Omit<Crop>>
}
