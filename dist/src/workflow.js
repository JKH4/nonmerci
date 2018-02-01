"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Workflow {
    /************************************************************************************************
      * Constructor
      ************************************************************************************************/
    constructor(stepCollection) {
        /************************************************************************************************
         * Privates methods
         ************************************************************************************************/
        /**
         * Workflow Step resolver
         */
        this.stepResolver = (step) => {
            console.log('stepResolver', step.id);
            step.payload().then((res) => {
                console.log('stepResolver THEN');
                step.onResolve ? this.stepResolver(step.onResolve(res)) : console.log('stepResolver NO MORE ACTION');
            }).catch((err) => {
                console.log('stepResolver CATCH');
                step.onReject ? this.stepResolver(step.onReject(err)) : console.log('stepResolver NO MORE ACTION');
            });
        };
        // Vérification intégrité de la step collection
        // 1) 1 seul début
        if (stepCollection.filter((step) => step.type === StepType.START).length !== 1) {
            console.log('Invalid stepCollection');
            throw new Error('Invalid stepCollection');
            // TODO : 2) tous les enchainements sont valides
        }
        else {
            this.steps = stepCollection;
        }
    }
    /************************************************************************************************
     * Public methods
     ************************************************************************************************/
    startWorkflow() {
        this.stepResolver(this.steps.find((step) => step.type === StepType.START));
    }
}
exports.default = Workflow;
var StepType;
(function (StepType) {
    StepType["START"] = "START";
    StepType["NORMAL"] = "NORMAL";
    StepType["END"] = "END";
})(StepType = exports.StepType || (exports.StepType = {}));
//# sourceMappingURL=workflow.js.map