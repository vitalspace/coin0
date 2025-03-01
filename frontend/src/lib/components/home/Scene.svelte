<script lang="ts">
  import { T, useRenderer, useTask, useThrelte } from "@threlte/core";
  import { interactivity, HTML, Stars } from "@threlte/extras";
  import { Spring } from "svelte/motion";
  import { scrollPercentage } from "../../stores/stores";
  import { Vector3 } from "three";
  import Coins from "./Coins.svelte";
  import Lights from "./Lights.svelte";

  interactivity();
  const { camera } = useThrelte();

  const coinsOpacity = new Spring(1, {
    stiffness: 0.1,
    damping: 0.4,
  });


  const lerp = (x: number, y: number, a: number) => (1 - a) * x + a * y;
  const scaleObject = (start: number, end: number) =>
    Math.max(0, ($scrollPercentage - start) / (end - start));

  const setUpCamera = () => {
    // camera.current.lookAt(0, 0, 0);
    camera.current.position.set(0, 0, 4);
  };

  let html1 = new Vector3(-9.2, 0, 0);
  const opacity = new Spring(0);

  const animations = [
    {
      range: [0, 25],
      update: () => {
        const progress = scaleObject(0, 25);
        html1.y = lerp(15, 0, progress);

        // console.log(progress);

        if (progress > 0.65) {
          // opacity.target = 1; // Controla la opacidad
          opacity.set(1);
        } else {
          // opacity.target = 0; // Controla la opacidad
          opacity.set(0);
        }

        // html1.x = lerp(0, 0, progress);
        // opacity.target = progress; // Controla la opacidad
      },
    },
    {
      range: [0, 10],
      update: () => {
        console.log("me cumplo")
        // camera.current.position.x = lerp(0, 20, scaleObject(0, 15));
        coinsOpacity.set(1);
       
        // console.log("coinsOpacity", coinsOpacity.current);
      },
    },

    {
      range: [10, 20],
      update: () => {
        console.log("me cumplo")
        // camera.current.position.x = lerp(0, 20, scaleObject(0, 15));
        coinsOpacity.set(0);
       
        // console.log("coinsOpacity", coinsOpacity.current);
      },
    },

    {
      range: [80, 100],
      update: () => {
        // camera.current.position.x = lerp(0, 4, scaleObject(80, 100));
        // camera.current.position.y = lerp(1, 2, scaleObject(80, 100));
      },
    },
  ];
  setUpCamera();

  useTask((delta) => {

    // console.log(html1.y);

    animations.forEach(({ range, update }) => {
      if ($scrollPercentage >= range[0] && $scrollPercentage <= range[1]) {
        update();
      }
    });
  });
</script>

<T.DirectionalLight position={[0, 10, 10]} castShadow color="white" />

<Lights />
<Coins fallback={null} error={null} children={null} opacity={coinsOpacity.current} />

<!-- <T.Mesh
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
</T.Mesh> -->

<!-- <HTML transform position={[html1.x, html1.y, -10]}>
  <div
    class="border border-white w-lg select-none space-y-2"
    style="opacity: {opacity.current}; transition: opacity 0.3s"
  >
    <h2 class=" font-bold text-[1.9rem]">
      Create your token in 3 simple steps
    </h2>

    <div class="flex gap-8 border border-red-400 w-full">
      <div class="w-full">
        <h3 class="">Choose your token</h3>
        <p class="text-[0.8rem]">
          Select your preferred blockchain and configure basic token parameters
        </p>
      </div>

      <div class="w-full">
        <h3>Customize</h3>
        <p class="text-[0.8rem]">
          Set your token's name, symbol, and initial supply - no coding required
        </p>
      </div>

      <div class="w-full">
        <h3>Launch</h3>
        <p class="text-[0.8rem]">
          Deploy your token with one click and start building your community
        </p>
      </div>
    </div>
  </div>
</HTML> -->

<Stars
  speed={2}
  fade={true}
  radius={100}
  depth={50}
  count={5000}
  factor={4}
  saturation={0}
/>
