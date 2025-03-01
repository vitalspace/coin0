<script>
    import { T, useTask } from '@threlte/core'
    import { interactivity, HTML, Stars } from '@threlte/extras'
    import { Spring } from 'svelte/motion'
  
    interactivity()
  
    const scale = new Spring(1)
  
    let rotation = 0
    useTask((delta) => {
      rotation += delta
    })
</script>

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<T.Mesh
  rotation.y={rotation}
  position={[4, 0, -4]}
  scale={scale.current}
  onpointerenter={() => {
    scale.target = 1.5;
  }}
  onpointerleave={() => {
    scale.target = 1;
  }}
  castShadow
>
  <T.BoxGeometry args={[1, 2, 1]} />
  <T.MeshStandardMaterial color="hotpink" />
</T.Mesh>

<!-- <T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.CircleGeometry args={[4, 40]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh> -->

<Stars speed={2} fade={true} radius={100} depth={50} count={5000} factor={4} saturation={0} />