import { motion } from 'framer-motion'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'

export default function AnimatedInfinityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex w-full items-center justify-center py-1 sm:py-2"
    >
      <div className="landing-toxic-logo-glow" />
      <div className="landing-toxic-logo-stage">
        <ScholaOneLogo
          size="hero"
          variant="full"
          className="w-full justify-center"
          imageClassName="mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px] xl:max-w-[380px]"
        />
      </div>
    </motion.div>
  )
}
