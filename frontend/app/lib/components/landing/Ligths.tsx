import React from 'react'

export default function Lights() {
  return (
    <>
      <pointLight color="#6fc7ba" distance={10} intensity={10} position={[2, 0, 2]} />
      <pointLight color="gold" distance={10} intensity={10} position={[0, 2, 2]} />
    </>
  )
}
