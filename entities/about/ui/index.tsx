"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/shared/ui/button";
import Link from "next/link";
import {
  SiGithub,
  SiLinkedin,
  SiTelegram,
} from "@icons-pack/react-simple-icons";
import Container from "@/shared/ui/container";

export function About() {
  return (
    <Container className="flex h-full flex-col items-center justify-center gap-3">
      <motion.h1
        initial={{
          fontSize: "min(12vw,120px)",
          lineHeight: "min(10vw,80px)",
        }}
        animate={{
          fontSize: "min(12vw,50px)",
          lineHeight: "min(10vw,40px)",
        }}
        transition={{
          duration: 0.3,
        }}
        className="text-center font-open-sans text-[min(12vw,120px)] font-light leading-[min(10vw,80px)]"
      >
        AVDEYEV.DEV
      </motion.h1>
      <motion.h2
        initial={{
          opacity: 0,
          height: 0,
        }}
        animate={{
          opacity: 1,
          height: "auto",
        }}
        transition={{
          duration: 0.3,
          delay: 0.3,
        }}
        className="font-open-sans text-[min(8vw,32px)]"
      >
        Frontend Developer
      </motion.h2>
      <motion.p
        className="text-md max-w-[800px] text-center lg:text-lg"
        initial={{
          opacity: 0,
          height: 0,
        }}
        animate={{
          opacity: 1,
          height: "auto",
        }}
        transition={{
          duration: 0.3,
          delay: 0.6,
        }}
      >
        {`Hello, I'm Ivan Avdeyev, a frontend developer who's all about making
        websites look good and work smoothly.`}
      </motion.p>
      <motion.ul
        initial={{
          opacity: 0,
          height: 0,
        }}
        animate={{
          opacity: 1,
          height: "auto",
        }}
        transition={{
          duration: 0.3,
          delay: 0.9,
        }}
        className="flex items-center gap-2"
      >
        <li>
          <Link
            href="https://t.me/eone666"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            target="_blank"
          >
            <SiTelegram />
          </Link>
        </li>
        <li>
          <Link
            href="https://www.linkedin.com/in/eone666/"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            target="_blank"
          >
            <SiLinkedin />
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/eone666"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            target="_blank"
          >
            <SiGithub />
          </Link>
        </li>
      </motion.ul>
    </Container>
  );
}
