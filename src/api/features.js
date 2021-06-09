const router = require('express').Router()
exports.router = router

//Route to create a new feature.
router.post('/:projectId/features/', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {
            throw "You are not authorized to create new features for this project"
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) {
            throw "Project ID not found in database"
        }
 
        if (!req.body) {
            throw "Feature not defined"
        }

        const feature = req.body;
        
        //reject if feature already exists.
        const existingFeature = await seqFeature.findOne({
            where: { title: feature.title }
        });
        if (existingFeature) {
            throw "Feature name already exists"
        }

        //add the projectId from the route to the feature.
        feature.projectId = projectId;

        //create the feature in db
        const createResult = await seqFeature.create(feature);
        res.status(201).json({
            id: createResult.id,
            links: {
                project: `/projects/${projectId}`,
                feature: `/projects/${projectId}/features/${createResult.id}`,
              }
        })
    } catch (error) { res.status(400).json({ error: error }) }
});

//Route to modify an existing feature.
router.put('/:projectId/features/:featureId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {
            throw "You are not authorized to edit this feature."
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) {
            throw "Project ID not found in database"
        }

        if (!req.body) {
            throw "Feature not defined"
        }

        const feature = req.body;
        feature.projectId = project.id;

        //update the feature
        const findOneResult = await seqFeature.findOne({where: {id: featureId}})
        if (!findOneResult) { throw "Feature not found." }

        //check to see whether the feature is associated with this project
        if (findOneResult.projectId != project.id) {
            throw "Feature not associated with project."
        }

        const updateResult = findOneResult.update(feature);

        if (!updateResult) { throw "Error updating feature" }
        res.status(200).send({
            id: featureId,
            links: {
              project: `/projects/${projectId}`,
              feature: `/projects/${projectId}/features/${featureId}`,
            }
        });
    } catch (error) { res.status(400).json({ error: error }) }
});

//Route to delete a feature.
router.delete('/:projectId/features/:featureId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const featureId = parseInt(req.params.featureId);

        //if user is not a developer or a user of this project, reject.
        if (req.user.projectId != 1 && req.user.projectId != projectId) {
            throw "You are not authorized to delete this feature."
        }

        //check to see whether there is a project with the given id.
        const project = await seqProject.findOne({ where: { id: projectId } })
        if (!project) {
            throw "Project ID not found in database"
        }

        //delete the feature
        const findOneResult = await seqFeature.findOne({where: {id: featureId}})
        if (!findOneResult) { throw "Feature not found." }

        //check to see whether the feature is associated with this project
        if (findOneResult.projectId != project.id) {
            throw "Feature not associated with project."
        }

        const deleteResult = findOneResult.destroy(feature);
        if (!deleteResult) { throw "Error deleting feature" }
    
        res.status(204).end();
    } catch (error) { res.status(400).json({ error: error }) }
});

//Route to get all features, including their definitions and questions (paginated)
router.get('/:projectId/features/', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId)

        // If the user is not a developer or a user of this project, reject
        if (req.user.projectId != 1 && req.user.projectId != projectId) {
            throw "You are not authorized to access this project"
        }

        // Compute page number based on optional query string parameter `page`
        // Make sure page is within allowed bounds
        let page = parseInt(req.query.page) || 1
        const numPerPage = 5
        const featuresCount = await seqFeature.count({ where: { projectId: projectId } })
        if (!featuresCount) { throw "Project has no features, or was not found in database" }
        const lastPage = Math.ceil(featuresCount / numPerPage)
        page = page > lastPage ? lastPage : page
        page = page < 1 ? 1 : page

        // Calculate starting and ending indices of businesses on requested page and
        // slice out the corresponsing sub-array of busibesses.
        const start = (page - 1) * numPerPage;
        const end = start + numPerPage;
        const pageOfFeatures = await seqFeature.findAll({
            where: { projectId: projectId },
            offset: start,
            limit: numPerPage,
            include: [seqDefinition, seqQuestion]
        })

        const links = {};
        if (page < lastPage) {
            links.nextPage = `/businesses?page=${page + 1}`;
            links.lastPage = `/businesses?page=${lastPage}`;
        }
        if (page > 1) {
            links.prevPage = `/businesses?page=${page - 1}`;
            links.firstPage = '/businesses?page=1';
        }

        res.status(200).json({
            features: pageOfFeatures,
            pageNumber: page,
            totalPages: lastPage,
            pageSize: numPerPage,
            totalCount: featuresCount,
            links: links
          });

        res.status(200).json({ length: businessesLength, last: lastPage });
    } catch (error) { res.status(400).json({ error: error }) }
});
