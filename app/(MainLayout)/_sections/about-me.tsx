import Section from "@/app/(MainLayout)/_components/section";
import H2 from "@/components/ui/h2";
import Image from "next/image";

export default function AboutMe() {
  return (
    <Section className="mx-auto flex max-w-[1000px] flex-col items-center gap-2 pt-2 xs:gap-4 sm:justify-between md:flex-row md:gap-10">
      <div className="shrink-0">
        <Image
          src="/my-photo.jpg"
          alt="my photo"
          width={300}
          height={300}
          className="h-[200px] w-[200px] md:h-[300px] md:w-[300px]"
        />
      </div>
      <div>
        <H2 className="mb-1 text-center xs:mb-2 md:mb-3 md:text-left">
          About me
        </H2>
        <div>
          <p className="mb-1 text-sm xs:text-[1em] md:mb-2">
            Hello, I&apos;m Ivan Avdeyev, a frontend developer who&apos;s all
            about making websites look good and work smoothly. My journey into
            web development started when I was in college.
          </p>
          <p className="mb-1 text-sm xs:text-[1em] md:mb-2">
            <strong>From Learning to React Expert:</strong>
          </p>
          <p className="mb-1 text-sm xs:text-[1em] md:mb-2">
            I began by making web pages with HTML and CSS. In my free time, I
            taught myself React, which is a cool tool for building websites.
            That led to my first job as a frontend developer, and I&apos;ve been
            working with React ever since.
          </p>
        </div>
      </div>
    </Section>
  );
}
