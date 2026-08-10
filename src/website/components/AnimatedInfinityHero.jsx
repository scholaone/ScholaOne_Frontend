import { motion } from 'framer-motion'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'

export default function AnimatedInfinityHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full min-h-[220px] w-full items-center justify-center py-1 sm:min-h-[260px] sm:py-2 lg:min-h-0"
    >
      <div className="landing-toxic-logo-glow" />
      <div className="landing-toxic-logo-stage">
        <ScholaOneLogo
          size="hero"
          variant="full"
          className="relative z-[1] w-full justify-center"
          imageClassName="mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px] xl:max-w-[500px]"
        />
      </div>
    </motion.div>
  )
}
