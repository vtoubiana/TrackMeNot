---
TrackMeNOT
---
<p><strong><em>TrackMeNot</em></strong>  is a lightweight browser extension that helps protect web searchers from surveillance and data-profiling by search engines. It does so not by means of concealment or encryption (i.e. covering one’s tracks), but instead by the opposite strategy: noise and obfuscation. With TrackMeNot, actual web searches, lost in a cloud of false leads, are essentially hidden in plain view. User-installed TrackMeNot works with Firefox and Chrome browsers, integrates with all popular search engines, and requires no 3rd-party servers or services.</p>
<h1 id="installation">Installation</h1>
<p>TrackMeNot can be installed from corresponding app stores on Google-Chrome and Mozilla-Firefox browsers.<br>
Additionally It can also be built from source.</p>
<h2 id="installation-on-chrome">Installation on Chrome</h2>
<ol>
<li>Go to <a href="https://chrome.google.com/webstore/detail/trackmenot/cgllkjmdafllcidaehjejjhpfkmanmka">TrackMeNot</a> Chrome Extension Webpage</li>
<li>Click <strong>Add to Chrome</strong>.</li>
</ol>
<h2 id="installation-on-firefox">Installation on Firefox</h2>
<ol>
<li>Go to <a href="https://addons.mozilla.org/en-US/firefox/addon/trackmenot/?src=search">TrackMeNot</a> Mozilla Addon Webpage</li>
<li>Click <strong>Add to Firefox</strong>.</li>
</ol>
<h2 id="building-from-source">Building from Source</h2>
<ol>
<li>Open a Terminal (Ctrl + Alt + t)</li>
<li>Execute : <code>git clone https://github.com/vtoubiana/TrackMeNot.git</code></li>
<li>For <strong>Chrome Browser</strong> : Go to Extensions <strong>-&gt;</strong>  Turn on Developer Mode <strong>-&gt;</strong> Load Unpacked <strong>-&gt;</strong> Select the Folder in which you downloaded the source code (step 2).</li>
</ol>
<h1 id="how-it-works">How it Works</h1>
<p>TrackMeNot runs as a low-priority background process that periodically issues randomized search-queries to popular search engines, e.g., <strong>AOL, Yahoo!, Google, and Bing</strong>. It hides users’ actual search trails in a cloud of ‘ghost’ queries, significantly increasing the difficulty of aggregating such data into accurate or identifying user profiles. TrackMeNot serves as a means of amplifying users’ discontent with advertising networks that not only disregard privacy, but also facilitate the bulk surveillance agendas of corporate and government agencies, as documented recently in disclosures by Edward Snowden and others. To better simulate user behavior TrackMeNot uses a dynamic query mechanism to ‘evolve’ each client (uniquely) over time, parsing the results of its searches for ‘logical’ future query terms with which to replace those already used.</p>
<h1 id="references">References</h1>
<p><a href="http://trackmenot.io/">Official Webpage</a><br>
<a href="http://trackmenot.io/faq.html">FAQs</a><br>
<a href="https://github.com/vtoubiana/TrackMeNot/blob/master/LICENSE">License</a><br>
<a href="http://trackmenot.io/resources/trackmenot2009.pdf">Papers</a></p>
<h1 id="created-by">Created By</h1>
<p>Daniel C. Howe<br>
Helen Nissenbaum</p>
<h1 id="developed-by">Developed By</h1>
<p>Vincent Toubiana</p>

