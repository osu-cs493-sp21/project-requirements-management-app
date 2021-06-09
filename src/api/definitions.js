const router = require('express').Router()
exports.router = router

//Route to add a new definition
router.post('/:projectId/features/:featureId/definitions', async (req, res) => {
    try {

        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {  
            throw "You are not authorized to create new definitions for this project" 
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

        //check to see whether the feature is associated with this project
        if (feature.projectId != project.id) {
            throw "Feature not associated with project."
        }

        if (!req.body) {
            throw "Definition not defined"
        }

        //Formulate the new definition object.
        const definition = req.body;
        definition.featureId = featureId;
        definition.userId = req.user.id;

        //create the definition in the db
        const createResult = await seqDefinition.create(definition);
        //console.log(createResult);
        if (!createResult) {
            throw "Error creating definition"
        }

        res.status(201).json({
            id: createResult.id,
            links: {
                project: `/projects/${projectId}`,
                feature: `/projects/${projectId}/features/${featureId}`,
                //definition: `/projects/${projectId}/features/${featureId}/definitions/${createResult.id}`
            }
        });
    } catch (error) { res.status(400).json({ error: error }) }
});

router.put('/:projectId/features/:featureId/definitions/:definitionId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);
        const definitionId = parseInt(req.params.definitionId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {  
            throw "You are not authorized to edit this definition" 
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

         //check to see whether the feature is associated with this project
         if (feature.projectId != project.id) {
            throw "Feature not associated with project."
        }

        const definition = req.body;
        definition.projectId = project.id;
        definition.featureId = feature.id;

        //update the definition
        const findOneResult = await seqDefinition.findOne({where: {id: definitionId}})
        if (!findOneResult) { throw "definition not found" }

        const updateResult = findOneResult.update(definition);

        if (!updateResult) { throw "Error updating definition" }

        res.status(200).json({
            id: featureId,
            links: {
                project: `/projects/${projectId}`,
                feature: `/projects/${projectId}/features/${featureId}`,
                //definition: `/projects/${projectId}/features/${featureId}/definitions/${definitionId}`
            }
        });
    } catch (error) { res.status(400).json({ error: error }) }
});   


//route to delete a definition
router.delete('/:projectId/features/:featureId/definitions/:definitionId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);
        const definitionId = parseInt(req.params.definitionId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {  
            throw "You are not authorized to delete this definition" 
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

        //check to see whether the feature is associated with this project
        if (feature.projectId != project.id) {
            throw "Feature not associated with project."
        }

        //delete the definition in the db
        const findOneResult = await seqDefinition.findOne({where: {id: definitionId}})
        if (!findOneResult) { throw "Definition not found" }

        const success = findOneResult.destroy();
        if (!success) { throw "Error deleting definition" }
    
        res.status(204).end();
    } catch (error) { res.status(400).json({ error: error }) }
});