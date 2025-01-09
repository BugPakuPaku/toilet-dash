import Image from 'next/image';

type Props = {
    src: string;
    className?: string;
};

export default function ToiletImage({ src, className }: Props) {
    return (
        <div
            className={`${className}`}
        >
            <Image
                src={src}
                alt="トイレの写真"
                fill
                style={{ objectFit: "cover" }}
                className="bg-white"
                priority={true}
            />
        </div>
    );
}