// Learner-owned boundaries. Timers only finish the current stage, never advance it.
export class LearningSteps {
  constructor(count,render){this.count=count;this.render=render;this.stage=-1;this.busy=false;this.timer=null;this.generation=0;}
  settle(){clearTimeout(this.timer);this.timer=null;this.generation++;this.busy=false;this.render(this.stage);}
  reset(){this.settle();this.stage=-1;this.render(this.stage);}
  previous(){if(this.busy)return;this.stage=Math.max(-1,this.stage-1);this.render(this.stage);}
  advance(duration){if(this.busy||this.stage>=this.count-1)return false;
    this.stage++;this.busy=true;const generation=++this.generation;this.render(this.stage);
    this.timer=setTimeout(()=>{if(generation!==this.generation)return;this.busy=false;this.timer=null;this.render(this.stage);},Math.max(0,duration));return true;
  }
}
