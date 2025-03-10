<!--
Auto-generated by: https://github.com/threlte/threlte/tree/main/packages/gltf
Command: npx @threlte/gltf@3.0.0 .\coin.glb --transform --draco ./draco
-->

<script lang="ts">
  import { Group } from "three";

  import { T, useTask } from "@threlte/core";
  import { useGltf, useGltfAnimations, useDraco } from "@threlte/extras";

  let { fallback, error, children, ref = $bindable(), opacity = 1, ...props } = $props();
  import { Vector3 } from "three";

  ref = new Group();
  let mainRef;


  const gltf = useGltf("/coin-transformed.glb", { dracoLoader: useDraco() });

  export const { actions, mixer } = useGltfAnimations(gltf, ref);


  const orbitConfig = {
    pepe: {
      radius: 5,
      speed: 0.8,
      angle: 0,
      axis: new Vector3(0.2, 1, 0.3).normalize(),
    },
    pinguin: {
      radius: 3,
      speed: 0.6,
      angle: Math.PI / 2,
      axis: new Vector3(-0.5, 0.7, 0.1).normalize(),
    },
    doge: {
      radius: 0,
      speed: 1.0,
      angle: Math.PI,
      axis: new Vector3(0.1, -0.8, 0.4).normalize(),
    },
    cat: {
      radius: 3,
      speed: 0.7,
      angle: (3 * Math.PI) / 2,
      axis: new Vector3(0.6, 0.2, -0.5).normalize(),
    },
    shiba: {
      radius: 3,
      speed: 0.5,
      angle: Math.PI / 4,
      axis: new Vector3(-0.3, 0.9, -0.2).normalize(),
    },
    near: {
      radius: 4,
      speed: 0.9,
      angle: (3 * Math.PI) / 4,
      axis: new Vector3(0.4, -0.1, 0.7).normalize(),
    },
    electrum: {
      radius: 5,
      speed: 0.8,
      angle: (5 * Math.PI) / 4,
      axis: new Vector3(-0.2, -0.6, 0.5).normalize(),
    },
  };

  const updateMaterialsOpacity = (node, opacity) => {

    // console.log(node)

      node.material.transparent = true;
      node.material.opacity = opacity;
      node.material.needsUpdate = true;
  }

  useTask((delta) => {
    if (!mainRef) return;

    const scenGroup = mainRef.getObjectByName("Scene");
    if (!scenGroup) return;
    const children = scenGroup.children;

    scenGroup.traverse((child) => {
      if (child.isMesh) {
        updateMaterialsOpacity(child, opacity);
      }
    });

    Object.entries(orbitConfig).forEach(([name, config]) => {
      const child = children.find((c) => c.name === name);

      // updateMaterialsOpacity(child, opacity);
      if (!child) return;

      config.angle += delta * config.speed;

      const newPosition = new Vector3()
        .set(1, 0, 0)
        .applyAxisAngle(config.axis, config.angle)
        .multiplyScalar(config.radius);

      child.position.copy(newPosition);
      child.rotation.y += delta * config.speed * 0.5
      child.rotation.x += delta * config.speed * 0.3
    });
  });
</script>

<T is={ref} bind:ref={mainRef} dispose={false} {...props}>
  {#await gltf}
    {@render fallback?.()}
  {:then gltf}
  <T.Group name="Scene" position={[2, 0, 0]} scale={0.3}>
    <T.Group name="electrum" scale={.5}>
      <T.Mesh
        name="electrum_1"
        geometry={gltf.nodes.electrum_1.geometry}
        material={gltf.materials['Material.002']}
      />
      <T.Mesh
        name="electrum_2"
        geometry={gltf.nodes.electrum_2.geometry}
        material={gltf.materials['SVGMat.006']}
      />
      <T.Mesh
        name="electrum_3"
        geometry={gltf.nodes.electrum_3.geometry}
        material={gltf.materials['SVGMat.006']}
      />
      <T.Mesh
        name="electrum_4"
        geometry={gltf.nodes.electrum_4.geometry}
        material={gltf.materials['SVGMat.006']}
      />
      <T.Mesh
        name="electrum_5"
        geometry={gltf.nodes.electrum_5.geometry}
        material={gltf.materials['SVGMat.006']}
      />
      <T.Mesh
        name="electrum_6"
        geometry={gltf.nodes.electrum_6.geometry}
        material={gltf.materials['SVGMat.008']}
      />
    </T.Group>
    <T.Group name="near" scale={.5}>
      <T.Mesh
        name="near_1"
        geometry={gltf.nodes.near_1.geometry}
        material={gltf.materials['Near Logo']}
      />
      <T.Mesh
        name="near_2"
        geometry={gltf.nodes.near_2.geometry}
        material={gltf.materials['Near Coin']}
      />
    </T.Group>
    <T.Group name="doge">
      <T.Mesh
        name="doge_1"
        geometry={gltf.nodes.doge_1.geometry}
        material={gltf.materials['Near Logo']}
      />
      <T.Mesh
        name="doge_2"
        geometry={gltf.nodes.doge_2.geometry}
        material={gltf.materials['Material.066']}
      />
      <T.Mesh
        name="doge_3"
        geometry={gltf.nodes.doge_3.geometry}
        material={gltf.materials['Material.061']}
      />
      <T.Mesh
        name="doge_4"
        geometry={gltf.nodes.doge_4.geometry}
        material={gltf.materials['Material.064']}
      />
      <T.Mesh
        name="doge_5"
        geometry={gltf.nodes.doge_5.geometry}
        material={gltf.materials['Material.062']}
      />
      <T.Mesh
        name="doge_6"
        geometry={gltf.nodes.doge_6.geometry}
        material={gltf.materials['Material.067']}
      />
      <T.Mesh
        name="doge_7"
        geometry={gltf.nodes.doge_7.geometry}
        material={gltf.materials['Material.063']}
      />
      <T.Mesh
        name="doge_8"
        geometry={gltf.nodes.doge_8.geometry}
        material={gltf.materials['Material.065']}
      />
      <T.Mesh
        name="doge_9"
        geometry={gltf.nodes.doge_9.geometry}
        material={gltf.materials['Material.069']}
      />
      <T.Mesh
        name="doge_10"
        geometry={gltf.nodes.doge_10.geometry}
        material={gltf.materials['Material.068']}
      />
      <T.Mesh
        name="doge_11"
        geometry={gltf.nodes.doge_11.geometry}
        material={gltf.materials['Material.070']}
      />
      <T.Mesh
        name="doge_12"
        geometry={gltf.nodes.doge_12.geometry}
        material={gltf.materials['Material.071']}
      />
      <T.Mesh
        name="doge_13"
        geometry={gltf.nodes.doge_13.geometry}
        material={gltf.materials['Material.073']}
      />
    </T.Group>
    <T.Group name="cat" scale={.5}>
      <T.Mesh
        name="cat_1"
        geometry={gltf.nodes.cat_1.geometry}
        material={gltf.materials['Material.020']}
      />
      <T.Mesh
        name="cat_2"
        geometry={gltf.nodes.cat_2.geometry}
        material={gltf.materials['SVGMat.012']}
      />
      <T.Mesh
        name="cat_3"
        geometry={gltf.nodes.cat_3.geometry}
        material={gltf.materials['Material.019']}
      />
      <T.Mesh
        name="cat_4"
        geometry={gltf.nodes.cat_4.geometry}
        material={gltf.materials['Material.023']}
      />
      <T.Mesh
        name="cat_5"
        geometry={gltf.nodes.cat_5.geometry}
        material={gltf.materials['Material.025']}
      />
      <T.Mesh
        name="cat_6"
        geometry={gltf.nodes.cat_6.geometry}
        material={gltf.materials['Material.026']}
      />
      <T.Mesh
        name="cat_7"
        geometry={gltf.nodes.cat_7.geometry}
        material={gltf.materials['Material.022']}
      />
      <T.Mesh
        name="cat_8"
        geometry={gltf.nodes.cat_8.geometry}
        material={gltf.materials['Material.021']}
      />
      <T.Mesh
        name="cat_9"
        geometry={gltf.nodes.cat_9.geometry}
        material={gltf.materials['Material.031']}
      />
      <T.Mesh
        name="cat_10"
        geometry={gltf.nodes.cat_10.geometry}
        material={gltf.materials['Near Logo']}
      />
      <T.Mesh
        name="cat_11"
        geometry={gltf.nodes.cat_11.geometry}
        material={gltf.materials['Material.028']}
      />
      <T.Mesh
        name="cat_12"
        geometry={gltf.nodes.cat_12.geometry}
        material={gltf.materials['Material.032']}
      />
      <T.Mesh
        name="cat_13"
        geometry={gltf.nodes.cat_13.geometry}
        material={gltf.materials['Material.030']}
      />
      <T.Mesh
        name="cat_14"
        geometry={gltf.nodes.cat_14.geometry}
        material={gltf.materials['Material.027']}
      />
      <T.Mesh
        name="cat_15"
        geometry={gltf.nodes.cat_15.geometry}
        material={gltf.materials['Material.024']}
      />
      <T.Mesh
        name="cat_16"
        geometry={gltf.nodes.cat_16.geometry}
        material={gltf.materials['Material.007']}
      />
    </T.Group>
    <T.Group name="shiba" scale={.5}>
      <T.Mesh
        name="shiba_1"
        geometry={gltf.nodes.shiba_1.geometry}
        material={gltf.materials['Shiba logo 1']}
      />
      <T.Mesh
        name="shiba_2"
        geometry={gltf.nodes.shiba_2.geometry}
        material={gltf.materials['Shiba logo 4']}
      />
      <T.Mesh
        name="shiba_3"
        geometry={gltf.nodes.shiba_3.geometry}
        material={gltf.materials['Material.030']}
      />
      <T.Mesh
        name="shiba_4"
        geometry={gltf.nodes.shiba_4.geometry}
        material={gltf.materials['Near Logo']}
      />
      <T.Mesh
        name="shiba_5"
        geometry={gltf.nodes.shiba_5.geometry}
        material={gltf.materials['Shiba inu Coin']}
      />
    </T.Group>
    <T.Group name="pepe" scale={.5}>
      <T.Mesh
        name="pepe_1"
        geometry={gltf.nodes.pepe_1.geometry}
        material={gltf.materials['SVGMat.012']}
      />
      <T.Mesh
        name="pepe_2"
        geometry={gltf.nodes.pepe_2.geometry}
        material={gltf.materials.SVGMat}
      />
      <T.Mesh
        name="pepe_3"
        geometry={gltf.nodes.pepe_3.geometry}
        material={gltf.materials['SVGMat.001']}
      />
      <T.Mesh
        name="pepe_4"
        geometry={gltf.nodes.pepe_4.geometry}
        material={gltf.materials['Pepe Coin']}
      />
    </T.Group>
    <T.Group name="pinguin" scale={.5}>
      <T.Mesh
        name="pinguin001"
        geometry={gltf.nodes.pinguin001.geometry}
        material={gltf.materials['Material.013']}
      />
      <T.Mesh
        name="pinguin001_1"
        geometry={gltf.nodes.pinguin001_1.geometry}
        material={gltf.materials['default.003']}
      />
      <T.Mesh
        name="pinguin001_2"
        geometry={gltf.nodes.pinguin001_2.geometry}
        material={gltf.materials['Material.033']}
      />
      <T.Mesh
        name="pinguin001_3"
        geometry={gltf.nodes.pinguin001_3.geometry}
        material={gltf.materials['Material.034']}
      />
      <T.Mesh
        name="pinguin001_4"
        geometry={gltf.nodes.pinguin001_4.geometry}
        material={gltf.materials['Material.035']}
      />
      <T.Mesh
        name="pinguin001_5"
        geometry={gltf.nodes.pinguin001_5.geometry}
        material={gltf.materials['Material.070']}
      />
    </T.Group>
  </T.Group>
  {:catch err}
    {@render error?.({ error: err })}
  {/await}

  {@render children?.({ ref })}
</T>
