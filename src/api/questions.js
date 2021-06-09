const router = require('express').Router()
exports.router = router

//Route to add a new question
router.post('/:projectId/features/:featureId/questions', async (req, res) => {
    try {

        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {  
            throw "You are not authorized to create new questions for this project" 
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) { 
            throw "Project ID not found in database" 
        }

        //check to see whether there is a feature with the given id.
        const feature = await seqFeature.findOne({ where: { id: featureId } })
        if (!feature) { 
            throw "Feature ID not found in database" 
        }

        console.log(req.user);
        //Formulate the new question object.
        const question = req.body;
        question.featureId = featureId;
        question.userId = req.user.id;

        //create the question in the db
        const createResult = await seqQuestion.create(question);
        res.status(201).json({
            id: createResult.id,
            links: {
                project: `/projects/${projectId}`,
                //feature: `/projects/${projectId}/features/${featureId}`,
                //question: `/projects/${projectId}/features/${featureId}/questions/${createResult.id}`
            }
        });
    } catch (error) { res.status(400).json({ error: error }) }
});

router.put('/:projectId/features/:featureId/questions/:questionId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);
        const questionId = parseInt(req.params.questionId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {  
            throw "You are not authorized to edit this question" 
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) { 
            throw "Project ID not found in database" 
        }

        //check to see whether there is a feature with the given id.
        const feature = await seqFeature.findOne({ where: { id: featureId } })
        if (!feature) { 
            throw "Feature ID not found in database" 
        }

        //update the question
        const updateResult = await seqFeature.update(req.body, {
            where: { id: questionId }
        });

        if (!updateResult) { throw "Error updating question" }

        res.status(200).json({
            id: featureId,
            links: {
                project: `/projects/${projectId}`,
                //feature: `/projects/${projectId}/features/${featureId}`,
                //question: `/projects/${projectId}/features/${featureId}/questions/${questionId}`
            }
        });
    } catch (error) { res.status(400).json({ error: error }) }
});   


//route to delete a question
router.delete('/:projectId/features/:featureId/questions/:questionId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);
        const questionId = parseInt(req.params.questionId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {  
            throw "You are not authorized to delete this question" 
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) { 
            throw "Project ID not found in database" 
        }

        //check to see whether there is a feature with the given id.
        const feature = await seqFeature.findOne({ where: { id: featureId } })
        if (!feature) { 
            throw "Feature ID not found in database" 
        }

        //delete the question in the db
        const success = await seqQuestion.destroy({ where: { id: questionId } });
    
        if (!success) { throw "Error deleting Question" }
    
        res.status(204).end();
    } catch (error) { res.status(400).json({ error: error }) }
});