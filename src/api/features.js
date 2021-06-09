const router = require('express').Router()
exports.router = router

router.post('/', async (req, res) => {
    try {
        const projectId =  parseInt(req.params.projectId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 || req.user.projectId != projectId) {  
            throw "You are not authorized to create new features for this project" 
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) { 
            throw "Project ID not found in database" 
        }

        //reject if feature already exists. 
        //TODO: How do we check whether feature exists only in project.
        const feature = req.body;
        const existingFeature = await seqFeature.findOne({
            where: {title: feature.title}
        });
        if (existingFeature) {
            throw "Feature name already exists"
        }

        //add the projectId from the route to the feature.
        feature.projectId = projectId;

        console.log("Creating new feature: ", feature);

        //create the feature in db
        const createResult = await seqFeature.create(feature);
        res.status(201).json({
            id: createResult.id
          })
    } catch (error) { res.status(400).json({ error: error }) }
});

router.put('/:featureId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId =  parseInt(req.params.featureId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 || req.user.projectId != projectId) {  
            throw "You are not authorized to edit this feature." 
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) { 
            throw "Project ID not found in database" 
        }

        //update the feature
        const updateResult = await seqFeature.update(req.body, {
            where: { id: featureId }
        });

        if (!updateResult) { throw "Error updating feature" }
        res.status(201).json({
            id: updateResult.id
        });
    } catch (error) { res.status(400).json({ error: error }) }
});

router.delete('/:featureId', async (req, res) => {    
    try {
        const projectId =  parseInt(req.params.projectId);
        const featureId =  parseInt(req.params.featureId);
        
        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 || req.user.projectId != projectId) {  
            throw "You are not authorized to delete this feature." 
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) { 
            throw "Project ID not found in database" 
        }
        
        //delete the feature
        const success = await seqFeature.destroy({ where: { id: featureId } });
    
        if (!success) { throw "Error deleting Feature" }
    
        res.status(201).send()
    } catch (error) { res.status(400).json({ error: error }) }
});
