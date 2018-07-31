// COPIED FROM HERE https://raw.githubusercontent.com/jamesseanwright/react-animation-frame/

import React, { Component } from "react";

export function ReactAnimationFrame(
  InnerComponent,
  throttleMs
) {
  return class AnimatedComponent extends Component {
    constructor() {
      super();

      this.loop = this.loop.bind(this);
      this.endAnimation = this.endAnimation.bind(this);
      this.startAnimation = this.startAnimation.bind(this);

      this.isActive = true;
      this.rafId = 0;
      this.lastInvocationMs = 0;
      this.startTime = 0;
    }

    loop(time) {
      const { lastInvocationMs, isActive } = this;
      const isAnimatable = !!(
        this.innerComponent && this.innerComponent.onAnimationFrame
      );

      if (this.startTime === 0) {
        this.startTime = time;
      }

      // Latter const is defensive check for React Native unmount (issues/#3)
      if (!isActive || !isAnimatable) return;

      const hasTimeElapsed =
        !throttleMs || time - lastInvocationMs >= throttleMs;

      if (hasTimeElapsed) {
        this.lastInvocationMs = time;
        this.innerComponent.onAnimationFrame(
          time - this.startTime,
          lastInvocationMs
        );
      }

      this.rafId = requestAnimationFrame(this.loop);
    }

    endAnimation() {
      cancelAnimationFrame(this.rafId);

      this.isActive = false;
    }

    startAnimation() {
      if (!this.isActive) {
        this.isActive = true;
        this.startTime = 0;
        this.rafId = requestAnimationFrame(this.loop);
      }
    }

    componentDidMount() {
      if (!this.innerComponent || !this.innerComponent.onAnimationFrame) {
        throw new Error(
          "The component passed to AnimationFrameComponent does not implement onAnimationFrame"
        );
      }


      this.rafId = requestAnimationFrame(this.loop);

    }

    componentWillUnmount() {
      this.endAnimation();
    }

    render() {
      return (
        <InnerComponent
          ref={node => (this.innerComponent = node)}
          endAnimation={this.endAnimation}
          startAnimation={this.startAnimation}
          {...this.props}
        />
      );
    }
  };
}
