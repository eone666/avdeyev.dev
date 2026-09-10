export type VoxelBackgroundProps = {
  seed: number
}

export function VoxelBackground({ seed }: VoxelBackgroundProps) {
  return (
    <canvas
      class="voxel-background"
      aria-hidden="true"
      data-voxel-background
      data-seed={seed}
    />
  )
}
