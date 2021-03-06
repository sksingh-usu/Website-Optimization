Website Optimization Project
========================

###Summary###
  This project is intended to optimize a webpage to achieve a Google Page-Speed  insight score of 90+ in Mobile and Desktop format. In addition the page navigation and interaction on the page should be  **>60fps.**


----------

###Project Structure###
 Following is the directory structure of the project which contains the Development and Production ready code for the project.
    .
    ├── node_modules                                                   
    ├── src                      # Development files                                                   
    ├── prod                     # Production files Minfied and Uglified                                                   
    ├── gruntfile.js                                                                
    ├── package.json             
    └── README.md

and `src` and `prod` directory has following structure:
	.
    ├── js                      # Javascript files                                                   
    ├── images                  # Compressed Images                                                   
    ├── css             		# CSS files                                                   
    ├──	index.html                                                   
    └── pizza.html
	
### Project Setup###

 - Copy the repo in your system and navigate to prod directory. 
 - Double click on index.html.
 - Press f12 on the keyboard. This will open the chrome developer window.
 - Press Ctrl+R and this will load the time line in the developer window.
 - Repeat the same step with Pizza.html.
 - Start the time line recording and then scroll the page for scrolling performance.
 - Click on the slider on the page for pizza resize performance.

Further notes on timeline navigation of chrome can be found out here: [Chrome Time Line](https://developer.chrome.com/devtools/docs/timeline)

----------
### Page Load###

#### Initial Observations####
![Page Load Results](/frontend-nanodegree-mobile-portfolio-master/data/InitialTimeLine.PNG). 
**Page Insight Score: Mobile/Desktop: 28/30**

 - Big Differences between Document content Load(Blue Dashed line),Paint(Green Dashed Line) and Load Event Line(Red Dashed Line).
This depicts that there is a lot of time spend in receiving the data and also to paint the data. This leads to the first hint of expensive resources being downloaded.
 - Multiple Recalculations of the styles on the document node.
 - Multiple Janks because of Analytics.js recalculating styles almost towards the end of the DOM load causing another style recalculation on Document Node.
 
#### Optimization####
**Image Compression:** Compressed the pizzeria.jpg from 2.2 Mb to 24kb using lossless compression from kraken
*Result- Mobile/Desktop-- 40/53*

**Style Sheet Optimization:** In-lined the style-sheet in the html file and also for the print.css(css while printing the page), added the `media` property so that it won't affect the CSSOM and Render tree construction AND only used when print command is issued on the page. This helps the Render tree construction for the above-the-fold html pretty fast and leads to a huge gain in performance.
*Result- Mobile/Desktop-- 77/89*

**Resource Optimization:** Removed the google web fonts for Open-Sans and inlined the fonts using W3C recommended CSS Web Safe Font Combinations.
*Result- Mobile/Desktop-- 80/89*

**Deferred Render Blocking JS:** Analytics.js was being loaded and causing a JANK as can be seen in the timeline image. This jank was causing the style recalculation on the document node causing a huge delay after content loading(Blue Dashed Line) on the page and actual painting of the page(Green Dashed Line). Applied the `Async` tag while loading the analytics.js and also moved the `script` tag to the bottom of the html towards the end of the `Body` tag. Due to this *Loads* and *scripting* function call moved beyond the load line.
**Mobile/Desktop -- 94/95**

![Post Optimization Results](/frontend-nanodegree-mobile-portfolio-master/data/CompleteDefferedJS.PNG)


###Page Navigation###

####Scroll Navigation####
**Initial Observation:** As can be seen in the timeline record while scrolling the website, there is a lot of JANKS after the script `main.js` is executed. These janks were forcing multiple style recalculations and forcing the render tree creation at every iteration of recalculations on the document node.  It can be seen in the timeline that the function causing this is updatePositions() in main.js. 

	   var items = document.querySelectorAll('.mover');
		for (var i = 0; i < items.length; i++) {
		  var phase = Math.sin((document.body.scrollTop / 1250) + (i % 5));
    items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
    }

 - `Math.sin((document.body.scrollTop / 1250) + (i % 5));`  is causing the DOM manipulation on each iteration.
 - `items[i].style.left = items[i].basicLeft + 100 * phase + 'px';` is causing the **layout, painting and Compositing** on each iteration


----------

    document.addEventListener('DOMContentLoaded', function() {
      var cols = 8;
        var s = 256;
          for (var i = 0; i < 200; i++) {var elem = document.createElement('img');
          elem.className = 'mover';
		  elem.src = "images/pizza.png";
	      elem.style.height = "100px";
		  elem.style.width = "73.333px";
		  elem.basicLeft = (i % cols) * s;
	     elem.style.top = (Math.floor(i / cols) * s) + 'px';
	     document.querySelector("#movingPizzas1").appendChild(elem);
	     }

 - Hard Coding of the loop to 200 pizzas is not necessary as most of the pizzas are overlapping the way left and top positions of the pizzas are calculated.
 - Style setting  `elem.style.height = "100px";` and 		  `elem.style.width = "73.333px";` on each iteration is also a reason of JANK in CSSOM modelling.

#####Solution####

 - `Math.sin((document.body.scrollTop / 1250) + (i % 5));` moved the calcualtion outside the loop as it is literally selecting a value from an array of 5 values(i%5 can be 5 different values only and  document.body.scrollTop is a constant for each scroll event).
 - **CSS3 Hardware Acceleration** Using the transform instead of setting the left position of element optimize the rendering path from layout, painting and Compositing to **Compositing ONLY**.
 - Using the DOM height and width No of pizza from a Magic No. 200 can be reduced to a smaller number. (47 in this case).
 - Removed the width and height setting of the image via JS and instead resized the image to these constant values helps rendering faster.

**Post Optimization Result-Scrolling**
![Post Optimization Pizza Resize Timeline](/frontend-nanodegree-mobile-portfolio-master/data/withoutupdateFunctionCall.PNG) 
 
#### Manipulating Element Action####

**Initial Observation** 

![Initial Pizza Resize Timeline](/frontend-nanodegree-mobile-portfolio-master/data/1-InitialChangePizza.PNG)

 - As can be seen in the timeline record while changing the pizza size, there is a lot of JANKS after the script `main.js`  is executed. These janks were forcing multiple style recalculations and forcing the render tree creation at every iteration of recalculations on the document node.  It can be seen in the timeline that the function causing this is resizePizzas() --> changePizzaSize() function. 
 
 

     <pre> // Iterates through pizza elements on the page and changes their widths
  function changePizzaSizes(size) {
    for (var i = 0; i < document.querySelectorAll(".randomPizzaContainer").length; i++) {
      var dx = determineDx(document.querySelectorAll(".randomPizzaContainer")[i], size);
      var newwidth = (document.querySelectorAll(".randomPizzaContainer")[i].offsetWidth + dx) + 'px';
      document.querySelectorAll(".randomPizzaContainer")[i].style.width = newwidth;
    }
  } <code>
      
 - On each iterations elements are selected from the document.
 - width is being set at each iteration forcing the browser to Layout, Paint and Composite the page.
 
 ####Solution####
 
 - Moved the constant calculations outside the loop.
 - Leveraged the multiple CSS styling per class basis here. Instead of setting the width of each element inside the loop, the class of the elements have been changed  to small medium and large and in the CSS the styles have been defined. This helps the CSSOM calcualtions to be performed only once after the JS is executed.
 
 **Post Optmization Result**
![Post Optimization Pizza Resize Timeline](/frontend-nanodegree-mobile-portfolio-master/data/resized.PNG)