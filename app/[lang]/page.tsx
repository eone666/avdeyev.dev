interface MainPageProps {
    params: {
        lang: string;
    };
}

export default async function Page({ params: { lang } }: MainPageProps) {
    return <div>{lang}</div>;
}
