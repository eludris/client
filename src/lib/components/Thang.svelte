<script lang="ts">
  export var animate: boolean = false;
</script>

<div id="outer-wrapper">
  <div class="wrapper" style:animation-name={animate ? '' : 'unset'}>
    <div class="outer"></div>
    <div class="middle"></div>
    <div class="inner"></div>
    <div class="pupil"></div>
  </div>
  <div class="wrapper" style:animation-name={animate ? '' : 'unset'}>
    <div class="outer"></div>
    <div class="middle"></div>
    <div class="inner"></div>
    <div class="pupil"></div>
  </div>
</div>

<style>
  #outer-wrapper {
    height: 300px;
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    gap: 325px;
    scale: 0.5;
  }

  @keyframes speen {
    0% {
      rotate: 0deg;
    }
    100% {
      rotate: 360deg;
    }
  }

  .wrapper {
    position: relative;
    animation: speen forwards 1500ms infinite;
  }

  .outer {
    position: absolute;
    top: -150px;
    left: -125px;
    height: 300px;
    width: 250px;
    border: 26px solid #727272;
    box-sizing: border-box;
    border-radius: 100%;
    z-index: 1;
  }

  .middle {
    position: absolute;
    top: -125px;
    left: -100px;
    height: 250px;
    width: 200px;
    background-color: #515151;
    border-radius: 100%;
  }

  .inner {
    position: absolute;
    top: -100px;
    left: -80px;
    height: 225px;
    width: 180px;
    background-color: #ffffff;
    border-radius: 100%;
  }

  .pupil {
    position: absolute;
    top: -30px;
    left: 20px;
    height: 120px;
    width: 90px;
    background-color: #000000;
    border-radius: 100%;
  }
</style>
