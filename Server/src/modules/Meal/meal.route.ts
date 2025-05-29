
import { Router } from "express";
import mealsService from "./meal.service";
import { UserRoles } from "../User/users.interface";
import { isAuthenticated} from "../../middleware/auth.middleware";
import mealsValidation from "./meal.validation";





const mealRouter : Router =  Router();

mealRouter.get('/',mealsService.getAllMeals);

mealRouter.get('/:id',mealsValidation.getOne,mealsService.getMealById);

mealRouter.post('/', isAuthenticated([UserRoles.MANAGER])
    ,mealsService.uploadImage,mealsService.saveImage
    , mealsValidation.createOne,mealsService.createMeals);

mealRouter.put('/:id', isAuthenticated([UserRoles.MANAGER]),
    mealsService.uploadImage,mealsService.updateImage
    ,mealsValidation.updateOne,mealsService.updateMeal); 

mealRouter.delete('/:id', isAuthenticated([UserRoles.MANAGER])
    ,mealsValidation.deleteOne,mealsService.deleteMeal);

    mealRouter.delete('/:id/image',
         isAuthenticated([UserRoles.MANAGER]),
         mealsValidation.deleteOne,
         mealsService.deleteMealImage

)




export default mealRouter;
