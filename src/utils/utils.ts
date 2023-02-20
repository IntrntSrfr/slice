import { centerCrop, makeAspectCrop, PercentCrop } from "react-image-crop";

export const centerCropImage = (img: HTMLImageElement): PercentCrop =>  {
    const { naturalWidth: width, naturalHeight: height } = img;
    const crop = centerCrop(
        makeAspectCrop({
                unit: '%',
                width: 25,
            },
            1,
            width,
            height
        ),
        width,
        height
    )
    return crop
}

