import Image from 'next/image';

type Props = {
    src: string;
    className?: string;
};

export default function ToiletImage({ src, className }: Props) {
    return (
        <div
            className={`mx-auto w-48 sm:w-60 min-h-48 grid place-items-center ${className}`}
        >
            <Image
                src={src}
                alt="トイレの写真"
                width={200}
                height={200}
                className="bg-white mx-auto"
                priority={true}
            />
        </div>
    );
}